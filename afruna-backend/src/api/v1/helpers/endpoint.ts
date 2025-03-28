// class Endpoint {
//   constructor(endpoint: string) {
//     _host
//     _port
//     _protocol

//     if (endpoint) {
//       const regex = /(http[s]?):\/\/([^:/\s]+)(:[0-9]+)?/;
//       const match = endpoint.match(regex);

//       if (match) {
//         this.protocol = match[1];
//         this.host = match[2];
//         this.port = match[3] ? parseInt(match[3].substring(1)) : null;
//       } else {
//         throw new Error(`Invalid endpoint: ${endpoint}`);
//       }
//     }
//   }

//   set hostname(val: string) {
//     return this._host;
//   }

//   host() {
//     return this.host;
//   }

//   href() {
//     return `${this.protocol}://${this.host}${this.port ? `:${this.port}` : ''}`;
//   }

//   port() {
//     return this.port;
//   }

//   protocol() {
//     return this.protocol;
//   }

//   toString() {
//     return this.href();
//   }
// }
