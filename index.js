/*
 * Copyright (c) 2012, Ben Noordhuis <info@bnoordhuis.nl>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

exports.start = start;
exports.broadcast = broadcast;

var net = require('net');
var os = require('os');
var connections = [];

function start(port) {
  net.createServer(port, on_connection).listen(port);
  var addresses = os.networkInterfaces()['wlan0'];
  var address = addresses && addresses[0].address || '0.0.0.0';
  console.log('Connect with: netcat %s %d', address, port);
}

function broadcast(msg, skip) {
  connections.forEach(function(conn) {
    if (conn !== skip) conn.write(msg);
  });
  process.stdout.write(msg);
}

function on_connection(conn) {
  conn.id = conn.remoteAddress + ':' + conn.remotePort;
  broadcast(conn.id + ' joined\n');
  connections.push(conn);
  conn.on('data', on_client_data)
  conn.on('close', on_client_exit);
  conn.on('error', on_client_exit);
}

function on_client_data(data) {
  var conn = this;
  broadcast(conn.id + ' says: ' + data, conn);
}

function on_client_exit(err) {
  var conn = this;
  if (err) console.error(conn.id + ' died: ' + err.message);
  connections.splice(connections.indexOf(conn)); // remove from list
  broadcast(conn.id + ' left\n');
}
