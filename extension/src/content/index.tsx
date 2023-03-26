import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Lottie from 'react-lottie'

import loadingLottie from './loading.json'
import * as S from './styled'

enum PrecessStatus {
  ChooseAsset = 'ChooseAsset',
  NeedApprove = 'NeedApprove',
  CreateRequest = 'CreateRequest',
  Processing = 'Processing',
  Refund = 'Refund',
  Success = 'Success',
  Failed = 'Failed',
}

const s = document.createElement('script')
s.src = chrome.runtime.getURL('web.js')
s.type = 'module'
document.head.appendChild(s)

const Modal = () => {
  const [status, setStatus] = useState<PrecessStatus | null>(null)
  const [payload, setPayload] = useState<number>(0)

  const selectBridge = () => {
    window.postMessage({ type: 'LiteBridgeExt', action: 'request_bridge', token: 'USDT' }, '*')
  }

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== window) return
      if (event.data.type !== 'LiteBridgePage') return
      console.log('LiteBridgePage', event.data)
      if (event.data.action !== 'process') return
      setStatus(event.data.status)
      setPayload(event.data.payload)
    }

    window.addEventListener('message', handler, false)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (status == null) {
    return null
  }

  if (status === PrecessStatus.ChooseAsset) {
    return (
      <S.Container>
        <S.Title>There is not enough OKT on your balance</S.Title>
        <S.Text>Select another asset to pay with</S.Text>

        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <S.StrokeButton style={{ flex: 1 }}>Cancel</S.StrokeButton>
          <S.Button style={{ flex: 1 }} onClick={() => selectBridge()}>
            Pay ({payload} USDT)
          </S.Button>
        </div>
      </S.Container>
    )
  }

  if (status === PrecessStatus.NeedApprove) {
    return (
      <S.Container>
        <S.Text>Step 1 of 3</S.Text>
        <S.Title>Approve allocation transaction </S.Title>
        <S.Text>We need this to understand how much we should swap on our end.</S.Text>
        <S.Button style={{ width: '100%' }}>Approving...</S.Button>
      </S.Container>
    )
  }

  if (status === PrecessStatus.CreateRequest) {
    return (
      <S.Container>
        <S.Text>Step 2 of 3</S.Text>
        <S.Title>Approve transfer transaction </S.Title>
        <S.Text>We will swap USDT to OKT to process your main transaction</S.Text>
        <S.Button style={{ width: '100%' }}>Approving...</S.Button>
      </S.Container>
    )
  }

  if (status === PrecessStatus.Processing) {
    return (
      <S.Container>
        <Lottie
          width={250}
          height={250}
          isClickToPauseDisabled
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingLottie,
          }}
        />
        <S.Text>Transferring tokens ({60 - payload} sec)</S.Text>
      </S.Container>
    )
  }

  if (status === PrecessStatus.Success) {
    return (
      <S.Container>
        <S.Text>Step 3 of 3</S.Text>
        <S.Title>Approve main transaction</S.Title>
        <S.Text>To finish the flow, approve this transaction</S.Text>
        <S.Button style={{ width: '100%' }}>Approving...</S.Button>
      </S.Container>
    )
  }

  if (status === PrecessStatus.Refund) {
    return (
      <S.Container>
        <S.Title>Transfer failed</S.Title>
        <S.Text>Approve transaction to make refund your USDT</S.Text>
        <S.Button style={{ width: '100%' }}>Approving...</S.Button>
      </S.Container>
    )
  }

  return null
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.createRoot(root).render(
  <>
    <S.GlobalStyles />
    <Modal />
  </>,
)
