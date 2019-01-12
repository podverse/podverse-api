import axios from 'axios'
import { config } from 'config'
const { coingateConfig, websiteDomain, websiteProtocol } = config
const { apiKey, baseUrl, description, priceAmount, priceCurrency, receiveCurrency,
  title } = coingateConfig

const websiteBaseUrl = `${websiteProtocol}://${websiteDomain}`

export const createCoingateOrder = async (data) => {
  let filteredData = {
    order_id: data.order_id,
    price_amount: priceAmount,
    price_currency: priceCurrency,
    receive_currency: receiveCurrency,
    title,
    description,
    callback_url: `${websiteBaseUrl}/payment/coingate-confirming?id=${data.order_id}`,
    cancel_url: `${websiteBaseUrl}/settings`,
    success_url: `${websiteBaseUrl}/payment/coingate-confirming?id=${data.order_id}`,
    token: data.token
  }

  return axios(`${baseUrl}/api/v2/order`, {
    method: 'post',
    headers: {
      Authorization: apiKey
    },
    data: filteredData,
    withCredentials: true
  })
}
