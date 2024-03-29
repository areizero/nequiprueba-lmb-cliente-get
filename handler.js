'use strict'

const AWS = require('aws-sdk')
const docDynamo = new AWS.DynamoDB.DocumentClient()

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS'
}

/**
 * Servicio que obtiene los clientes
 */
module.exports.get = async (event, context) => {
  try {
    let queryParams = event.queryStringParameters
    let pathParams = event.pathParameters
    let params = {
      TableName: 'nequi-cliente'
    }
    if(queryParams && queryParams.idTipo && queryParams.idNumero) {
      params.ExpressionAttributeNames = { '#id': 'id'}
      params.ExpressionAttributeValues = { ':id': `${queryParams.idTipo}-${queryParams.idNumero}`}
      params.FilterExpression = "#id = :id"
      let clientes = await scan(params)
      return sendResponse(200, getClientesResponse(clientes)[0], headers)
    }
    if(queryParams && queryParams.edadMinima) {
      params.ExpressionAttributeNames = { '#edad': 'edad'}
      params.ExpressionAttributeValues = { ':edad': parseInt(queryParams.edadMinima)}
      params.FilterExpression = "#edad >= :edad"
    }
    let clientes = await scan(params)
    return sendResponse(200, getClientesResponse(clientes), headers)
  }
  catch (e) {
    console.error(e)
    return sendResponse(500, { message: `Internal server error: ${e}` }, headers)
  }
}

const getClientesResponse = (clientes) => {
  let clientesRs = []
  clientes.Items.forEach(item => {
    let idTipo = item.id.split('-')[0]
    let idNumero = item.id.split('-')[1]
    clientesRs.push({
      idTipo: idTipo, 
      idNumero: idNumero,
      nombre: item.nombre,
      apellido: item.apellido,
      ciudadNacimiento: item.ciudadNacimiento,
      edad: item.edad,
      imagenPerfil: item.imagenPerfil
    })
  })
  return clientesRs
}

const scan = (params) => {
  return docDynamo.scan(params).promise()
}

// metodos de respuesta
const sendResponse = (statusCode, body, headers = '') => {
  const response = {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(body)
  }
  return response
}
