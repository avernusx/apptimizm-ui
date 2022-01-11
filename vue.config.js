module.exports = {
	chainWebpack: config => {
		const svgModule = config.module.rule('svg')
		svgModule.uses.clear()
		svgModule
			.use('url-loader')
			.loader('url-loader')
			.tap(options => {
				return {
					limit: 4096*1024*1024
				}
			})
	}
}