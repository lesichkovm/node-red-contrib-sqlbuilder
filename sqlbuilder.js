const knex = require('knex')

module.exports = function (RED) {
  function SqlNode(config) {
    RED.nodes.createNode(this, config)
    var node = this
    var sqldialect = config.sqldialect // Type of SQL dialect
    var sqlquery = config.sqlquery

    node.on('input', function (msg) {
      query = knex({
        client: sqldialect,
      })

      try {
        sql = eval(sqlquery).toString()
        node.status({ fill: 'green', shape: 'dot', text: 'query built ok' })
      } catch (error) {
        sql = null
        node.error('sql : builder error', msg)
        node.status({ fill: 'red', shape: 'dot', text: 'query builder failed' })
        msg.payload = error
      }

      //msg.sqldialect = sqldialect
      msg.sql = sql

      //msg.payload = response.data
      node.send(msg)
    })
  }

  // Registering the node-red type
  RED.nodes.registerType('sqlbuilder', SqlNode)
}
