import React from 'react'
import wechatImg from '../assets/wechat.jpg'
import alipayImg from '../assets/alipay.jpg'

export function About() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* 头部信息 */}
      <div className="card rounded-3xl p-6 sm:p-8 mb-4 text-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Docker Copilot</h1>
        <p className="text-gray-600 dark:text-gray-400">一个简洁优雅的Docker容器管理工具</p>
      </div>

      {/* 主要内容 */}
      <div className="space-y-4">
        {/* 感谢卡片 */}
        <div className="card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">致谢</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            非常感谢大家自项目开始以来的使用、建议、鼓励和支持。特别感谢绿联对本项目的支持。没有大家的反馈，Docker Copilot 不会是今天的样子。他是属于我们共同的作品。
          </p>
        </div>

        {/* 反馈卡片 */}
        <div className="card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">反馈与建议</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            在项目使用中遇到 bug 或想要提建议？欢迎在 
            <a 
              href="https://github.com/onlyLTY/dockercopilot/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
            >
              GitHub Issues
            </a>
            {' '}提出，或发送邮件至
            <a 
              href="mailto:onlylty@lty.wiki" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium transition-colors"
            >
              onlylty@lty.wiki
            </a>
            。期待您的反馈！
          </p>
        </div>

        {/* 赞赏卡片 */}
        <div className="card p-6 sm:p-8 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 hover:shadow-lg transition-all">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-primary-900 dark:text-primary-200 mb-2">最后的最后</h2>
            <p className="text-primary-800 dark:text-primary-300 mb-4">
              如果您用的愉快的话，可以请我喝一瓶快乐水吗？您的支持是我持续维护项目的动力！
            </p>
            
            {/* 赞赏码 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-600 bg-white hover:shadow-xl transition-all transform hover:scale-105">
                  <img 
                    src={wechatImg} 
                    alt="微信赞赏码" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="mt-4 text-base font-semibold text-primary-700 dark:text-primary-300">微信支付</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-600 bg-white hover:shadow-xl transition-all transform hover:scale-105">
                  <img 
                    src={alipayImg} 
                    alt="支付宝赞赏码" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="mt-4 text-base font-semibold text-primary-700 dark:text-primary-300">支付宝支付</span>
              </div>
            </div>
          </div>
        </div>

        {/* 信息卡片 */}
        <div className="card p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">项目地址</p>
              <a 
                href="https://github.com/onlyLTY/dockercopilot" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline truncate"
              >
                GitHub
              </a>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">联系方式</p>
              <a 
                href="mailto:onlylty@lty.wiki"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline truncate"
              >
                onlylty@lty.wiki
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}