import Web3 from 'web3'
import BN from 'bn.js'

import ERC20 from './ERC20'
import apiContract from './LiteBridge'
import { RequestArguments } from '@metamask/providers/dist/BaseProvider'

const BRIDGE = Web3.utils.toChecksumAddress('0x8667e2d2550fd86728d25022ca11dbed68005fc9')
const USDT = Web3.utils.toChecksumAddress('0xc2132d05d31c914a87c6611c10748aeb04b58e8f')
const BASE = Web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000')

const getAddress = () => Web3.utils.toChecksumAddress(window.ethereum!.selectedAddress!)
const okxProvider = new Web3(new Web3.providers.HttpProvider('https://exchainrpc.okex.org'))
const polygonProvider = new Web3(new Web3.providers.HttpProvider('https://polygon.rpc.blxrbdn.com'))

const getOptions = async () => {
  return [
    { token: 'USDT', usd_rate: 0.98 },
    { token: 'OTK', usd_rate: 20.5 },
  ]
}

enum PrecessStatus {
  ChooseAsset = 'ChooseAsset',
  NeedApprove = 'NeedApprove',
  CreateRequest = 'CreateRequest',
  Processing = 'Processing',
  Refund = 'Refund',
  Success = 'Success',
  Failed = 'Failed',
}

const extensionCall = (action: string, payload?: Record<string, any>) => {
  window.postMessage({ type: 'LiteBridgePage', ...payload, action })
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.data.type !== 'LiteBridgeExt') return
  console.log('LiteBridgeExt', event.data)
})

const extensionWait = (action: string) => {
  return new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      if (event.data.type !== 'LiteBridgeExt') return
      console.log('LiteBridgeExt', event.data)
      if (event.data.action !== action) return
      window.removeEventListener('message', handler)
      if (event.data.rejected === true) reject()
      else resolve()
    }

    window.addEventListener('message', handler)
  })
}

const bridgePolygon = async (pay: BN) => {
  const metamask = new Web3(window.ethereum as any)
  const contract = new metamask.eth.Contract(apiContract as any, BRIDGE)
  const usdtContract = new metamask.eth.Contract(ERC20 as any, USDT)
  const address = getAddress()

  extensionCall('process', { status: PrecessStatus.NeedApprove })

  await window.ethereum?.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x' + (137).toString(16) }],
  })

  const options = await getOptions()
  const usdtUsdRate = options.find((t) => t.token === 'USDT')?.usd_rate ?? 1
  const otkUsdRate = options.find((t) => t.token === 'OTK')?.usd_rate ?? 1
  const usdt = Math.floor(
    (+pay.toString(10) / Math.pow(10, 18)) * otkUsdRate * usdtUsdRate * 1000000,
  )

  console.log({ usdt, pay })

  const approveABI = usdtContract.methods.approve(BRIDGE, usdt).encodeABI()
  await window.ethereum?.request({
    params: [{ to: USDT, from: address, data: approveABI }],
    method: 'eth_sendTransaction',
  })

  extensionCall('process', { status: PrecessStatus.CreateRequest })
  const createRequstABI = contract.methods
    .createRequest(USDT, usdt, address, BASE, pay, 66)
    .encodeABI()

  await window.ethereum?.request({
    params: [{ to: BRIDGE, from: address, data: createRequstABI }],
    method: 'eth_sendTransaction',
  })

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const okxBalanceBefore = await okxProvider.eth.getBalance(address)

  const awaitIncome = new Promise<void>((resolve, reject) => {
    const startDate = Date.now()
    const checkBalance = async () => {
      const newBalance = await okxProvider.eth.getBalance(address)
      console.log('Check balance')

      if (new BN(newBalance).cmp(new BN(okxBalanceBefore)) > 0) {
        const receive = new BN(newBalance).sub(new BN(okxBalanceBefore))
        console.log('Received OTK', +receive.toString(10) / Math.pow(10, 18))
        return resolve()
      }

      extensionCall('process', {
        status: PrecessStatus.Processing,
        payload: Math.floor((Date.now() - startDate) / 1000),
      })

      if (Date.now() - startDate > 1000 * 60) return reject()
      await wait(1000)
      checkBalance()
    }

    checkBalance()
    extensionCall('process', {
      status: PrecessStatus.Processing,
      payload: 0,
    })
  })

  try {
    await awaitIncome
    extensionCall('process', { status: PrecessStatus.Success })
  } catch {
    extensionCall('process', { status: PrecessStatus.Refund })
    const data = contract.methods.disputeRequest().encodeABI()
    await window.ethereum?.request({
      params: [{ to: BRIDGE, from: address, data }],
      method: 'eth_sendTransaction',
    })

    throw Error("Lite Bridge does't work now, try again please")
  }
}

const interceptTransferCall = async (args: RequestArguments) => {
  const currentChain = await window.ethereum!.request<string>({ method: 'eth_chainId' })
  if (currentChain != null && parseInt(currentChain, 16) === 66) {
    // @ts-ignore
    const value = Array.isArray(args.params) ? args.params[0].value : args.params.value

    const address = Web3.utils.toChecksumAddress(window.ethereum!.selectedAddress!)
    const okxBalance = new BN(await okxProvider.eth.getBalance(address))
    const transferAmount = new BN(value, 16)
    const pay = transferAmount.sub(okxBalance)

    //if (okxBalance.cmp(transferAmount) <= 0) {
    const options = await getOptions()
    const usdtUsdRate = options.find((t) => t.token === 'USDT')?.usd_rate ?? 1
    const otkUsdRate = options.find((t) => t.token === 'OTK')?.usd_rate ?? 1
    const usdt = (+pay.abs().toString(10) / Math.pow(10, 18)) * otkUsdRate * usdtUsdRate

    extensionCall('process', {
      status: PrecessStatus.ChooseAsset,
      payload: usdt.toFixed(2),
    })

    await extensionWait('request_bridge')
    await bridgePolygon(new BN(Math.floor(usdt * 1000000).toString()))
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + (66).toString(16) }],
    })
    // }
  }
}

const intercepGetBalance = async () => {
  const address = getAddress()
  const okxBalance = new BN(await okxProvider.eth.getBalance(address))

  const options = await getOptions()
  const usdtUsdRate = options.find((t) => t.token === 'USDT')?.usd_rate ?? 1
  const otkUsdRate = options.find((t) => t.token === 'OTK')?.usd_rate ?? 1

  const contract = new polygonProvider.eth.Contract(ERC20 as any, USDT)
  const usdtBalance = await contract.methods.balanceOf(address).call()
  const usdt2okxHuman = ((usdtBalance / 1000000) * usdtUsdRate) / otkUsdRate
  const usdt2okx = Math.floor(usdt2okxHuman * Math.pow(10, 18))

  const balance = okxBalance.add(new BN(usdt2okx.toString())).toString(10)
  return balance
}

const initializeLiteBridge = async () => {
  if (window.ethereum == null) return

  const eth_request = window.ethereum.request.bind(window.ethereum)
  window.ethereum.request = async function (args) {
    if (args.method == 'eth_getBalance') {
      try {
        return await intercepGetBalance()
      } catch (e) {
        console.error('[LiteBridgePage] intercepGetBalance error', e)
      }
    }

    if (args.method === 'eth_sendTransaction') {
      try {
        await interceptTransferCall(args)
      } catch (e) {
        extensionCall('process', { status: PrecessStatus.Failed })
        console.error('[LiteBridgePage] interceptTransferCall error', e)
      }
    }

    const result = await eth_request(args)
    return result
  }

  console.log('[Lite Bridge] Metamask has been patched')
}

initializeLiteBridge()
