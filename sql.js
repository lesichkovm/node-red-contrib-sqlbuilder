const knex = require('knex')

module.exports = function (RED) {
  function SqlNode(config) {
    RED.nodes.createNode(this, config)
    var node = this
    var sqldialect = config.sqldialect // Type of SQL dialect
    var sqlquery = config.sqlquery

    node.on('input', function (msg) {
      // Sets the SQL if it comes via msg.topic
      //   if (sqlquery == 'msg.topic') {
      //     if (typeof msg.topic !== 'string') {
      //       node.error('msg.topic : the query is not defined as string', msg)
      //       node.status({ fill: 'red', shape: 'dot', text: 'msg.topic error' })
      //       msg.payload = {
      //         status: 'error',
      //         message: 'msg.topic IS NOT a string',
      //       }
      //       node.send(msg)
      //       return false
      //     }

      //     if (msg.topic.length < 1) {
      //       node.error('msg.topic : the query is empty', msg)
      //       node.status({ fill: 'red', shape: 'dot', text: 'msg.topic error' })
      //       msg.payload = {
      //         status: 'error',
      //         message: 'msg.topic CAN NOT be empty string',
      //       }
      //       node.send(msg)
      //       return false
      //     }

      //     sql = msg.topic
      //   }

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
      msg.sql = sqlquery

      //msg.payload = response.data
      node.send(msg)
    })
  }

  // Registering the node-red type
  RED.nodes.registerType('sql', SqlNode)
}
