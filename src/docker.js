/**
 * Socket-based Docker client wrapper for Node
 */
'use strict'

const R         = require('ramda-maybe')
const List      = require('../lib/list')
const Future    = require('ramda-fantasy').Future
const Either    = require('ramda-fantasy').Either
const Maybe     = require('ramda-fantasy').Maybe
const net       = require('net')
const query     = require('querystring')
const parser    = require('http-string-parser')

/**
 * Docker module wrapper
 */
let docker = exports

/**
 * Top-level protocol-aware wrapper around net socket communication
 */
docker.connect = (host) => R.pipe(
    R.defaultTo({}),
    R.cond([
        [R.propEq('type', 'unix'), () => Either.Right(docker.connectUnix)],
        [R.propEq('type', 'tcp'), () => Either.Right(docker.connectTcp)],
        [R.T, () => Either.Left(new Error('Invalid DOCKER_HOST type'))],
    ])
)(host)

// doc: TCP-specific connection to Docker socket
docker.connectTcp = (host) => {
    host = R.compose(
        R.fromPairs,
        R.zip(['host', 'port']),
        R.split(':')
    )(host.host)

    return net.connect(parseInt(host.port), host.host)
}

// doc: Unix-specific connection to Docker socket
docker.connectUnix = (host) => net.connect({ path: host.host })

// doc: Decorate the client with given event listeners
docker.decorateClient = (client, methods) => {
    // doc: Method is a k=>v pair of event name and callback (as [0] and [1])
    const bindEventListeners = (method) => client.on(method[0], method[1])

    const decorate = R.pipe(
        R.defaultTo({}),
        R.toPairs,
        R.map(bindEventListeners)
    )

    return decorate(methods)
}

// doc: Builds a request string for our
docker.buildRequest = (method, endpoint, data) => {
    method = R.defaultTo('get')(method)
    endpoint = R.defaultTo('/')(endpoint)
    data = R.defaultTo(null)(data)

    return `${method.toUpperCase()} ${endpoint} HTTP/1.0\r\n\n`
}

// doc: Sends a request to the Docker socket and returns a Future
docker.sendRequest = (client, method, endpoint) => {
    return Future((reject, resolve) => {
        let buf = ''
        docker.decorateClient(client, {
            data: (chunk) => buf += chunk.toString(),
            close: () => resolve(buf),
            error: (err) => reject(err),
        })
        // Send the request
        client.write(docker.buildRequest(method, endpoint))
    })
}

// Parses a response Buffer from docker.connect
// parseRequest :: Buffer -> Either (Error, Object)
docker.parseResponse = (response) => {
    const responseString = response.toString()
    const parsed = parser.parseResponse(responseString)

    const getProps = R.props([
        'protocolVersion',
        'statusCode',
        'statusMessage',
        'headers',
        'body'
    ])

    // propsToMaybe :: Object -> [Maybe]
    const propsToMaybe =
        getProps(parsed).map(R.cond([
            [R.isNil, Maybe.Nothing],
            [R.isEmpty, Maybe.Nothing],
            [R.T, Maybe.Just]
        ]))

    // anyPropsAreNothing :: [a] -> Bool
    const anyPropsAreNothing = v => List.of(...v).any(p => p.isNothing)

    return R.ifElse(
        anyPropsAreNothing,
        () => Either.Left(new Error()),
        () => Either.Right(parsed)
    )(propsToMaybe)
}
