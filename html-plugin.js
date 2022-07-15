/**
 * 为vite提供生成入口html插件
 */

const fs = require("fs/promises")

const path = require("path")

const { createLink, createScript, generateHTML } = require("./utils")

module.exports = () => ({
  name: "cteate-html",
  setup(build) {
    build.onEnd(async (buildResult) => {
      if (buildResult.errors.length) {
        return
      }
      const { metafile } = buildResult
      const scripts = []
      const links = []
      if (metafile) {
        const { outputs } = metafile
        const assets = Object.keys(outputs)

        assets.forEach((asset) => {
          if (asset.endsWith(".js")) {
            scripts.push(createScript(asset))
          } else if (asset.endsWith(".css")) {
            links.push(createLink(asset))
          }
        })
      }
      // 2. 拼接 HTML 内容
      const templateContent = generateHTML(scripts, links)
      // 3. HTML 写入磁盘
      const templatePath = path.join(process.cwd(), "index.html")
      await fs.writeFile(templatePath, templateContent)
    })
  },
})
