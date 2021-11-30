const knex = require('knex')

module.exports = function (RED) {
  function SqlNode(config) {
    RED.nodes.createNode(this, config)
    var node = this

    this.text = config.text
    this.field = config.field || 'sql'
    this.fieldType = config.fieldType || 'msg'
    this.sqldialect = config.sqldialect // Type of SQL dialect
    this.sqlquery = config.sqlquery

    node.on('close', (done) => {
      // node.warn('ON CLOSE')
      node.done()
    })

    node.on('input', (msg, send, done) => {
      let options = {
        client: node.sqldialect,
      }

      if (node.sqldialect === 'sqlite3') {
        options.useNullAsDefault = true // SQLite does not support inserting default values
      }

      query = knex(options)

      try {
        sql = eval(node.sqlquery).toString()
        node.status({ fill: 'green', shape: 'dot', text: 'ok' })
      } catch (error) {
        sql = null
        node.error('sql : builder error', msg)
        node.status({ fill: 'red', shape: 'dot', text: 'failed' })
        msg.payload = error
      }

      // DEBUG; msg.options = options
      // DEBUG: msg.sqldialect = sqldialect

      // Set msg to the set property
      if (node.fieldType === 'msg') {
        RED.util.setMessageProperty(msg, node.field, sql)
        send(msg)
        done()
      } else if (node.fieldType === 'flow' || node.fieldType === 'global') {
        var context = RED.util.parseContextStore(node.field)
        var target = node.context()[node.fieldType]
        target.set(context.key, sql, context.store, function (err) {
          if (err) {
            done(err)
          } else {
            send(msg)
            done()
          }
        })
      } else {
        // should never reach here
        msg.payload = sql
        send(msg)
        done()
      }
    })
  }

  // Registering the node-red type
  RED.nodes.registerType('sqlbuilder', SqlNode)
}
