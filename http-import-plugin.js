/**
 * 为vite提供cdn import功能插件
 */

const { build } = require("esbuild")

module.exports = () => ({
  name: "esbuild:http",
  setup(build) {
    let https = require("https")
    let http = require("http")
    // 1.拦截http请求
    build.onResolve({ filter: /^https?:\/\// }, (args) => ({
      path: args.path,
      namespace: "http-url",
    }))

    // 2
    build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => ({
      // 重写路径
      path: new URL(args.path, args.importer).toString(),
      namespace: "http-url",
    }))

    // 2.通过fetch来获取cdn资源
    build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
      let contents = await new Promise((resolve, reject) => {
        function fetch(url) {
          console.log(`Downloading: ${url}`)
          let lib = url.startsWith("https") ? https : http
          lib
            .get(url, (res) => {
              if ([301, 302, 307].includes(res.statusCode)) {
                // 重定向
                fetch(new URL(res.headers.location, url).toString())
                req.abort()
              } else if (res.statusCode === 200) {
                // 成功
                let chunks = []
                res.on("data", (chunk) => chunks.push(chunk))
                res.on("end", () => resolve(Buffer.concat(chunks)))
              } else {
                // 失败
                reject(new Error(`GET ${url} failed: status ${res.statusCode}`))
              }
            })
            .on("error", reject)
        }
        fetch(args.path)
      })
      return { contents }
    })
  },
})