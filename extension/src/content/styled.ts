import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
@font-face {
  font-family: "HarmonyOS Sans"; 
  src: url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.eot"); 
  src: url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.eot?#iefix") format("embedded-opentype"), 
       url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.woff2") format("woff2"), 
       url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.woff") format("woff"), 
       url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.ttf") format("truetype"),
      url("https://db.onlinewebfonts.com/t/876476f9c21d688286b0ec4bf47013a7.svg#HarmonyOS Sans") format("svg");
  } 
`

export const Container = styled.div`
  background: #ffffff;
  box-shadow: rgb(48 60 73 / 30%) 0px 1px 20px;
  border-radius: 8px 8px 0 0;
  width: 390px;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  padding-bottom: 48px;

  position: fixed;
  bottom: 0;
  right: 24px;
`

export const Title = styled.h2`
  font-family: 'HarmonyOS Sans';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #000000;
  margin: 12px 0;
`

export const Text = styled.p`
  font-family: 'HarmonyOS Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  color: #929292;
  margin: 0;
`

export const TokenBadge = styled.div``

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  gap: 4px;
  height: 48px;
  background: #000000;
  border-radius: 40px;
  border: none;

  margin-top: 24px;

  font-family: 'HarmonyOS Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #fff;

  outline: none;
  cursor: pointer;
`

export const StrokeButton = styled(Button)`
  background: #fff;
  border: 1px solid #000;
  color: #000;
`
