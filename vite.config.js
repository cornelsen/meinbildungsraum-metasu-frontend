/*
 * Copyright (c) 2023 Cornelsen Verlag GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import dns from 'dns'
import path from 'path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vuetify  from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'
import legacy from '@vitejs/plugin-legacy'

dns.setDefaultResultOrder('verbatim')


export default ({ mode }) => {
  const env = loadEnv(mode, './')
  return defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => {
              return tag.includes('swiper-')
            }
          }
        }
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      VueI18nPlugin({ include: `${path.resolve(__dirname, 'src/locales')}/**` }),
      vuetify({ styles: { configFile: 'src/styles/_vuetifyVariables.scss' } }),
      svgLoader({
        svgo: false,
        svgoConfig: {
          plugins: [{
            name: 'preset-default',
            params: {
              overrides: {
                inlineStyles: {
                  onlyMatchedOnce: false,
                }
              }
            }
          }]
        }
      })
    ],
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname, 'src')}/`
      }
    },
    css: {
      url: false,
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "./src/styles/_colors.scss";
            @import "./src/styles/_margins.scss";
            @import "./src/styles/_typography.scss";
          `
        }
      }
    },
    server: {
      port: Number(env.VITE_PORT),
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true
        },
        '/oauth2': {
          target: env.VITE_API_URL,
          changeOrigin: true
        },
        '/login': {
          target: env.VITE_API_URL,
          changeOrigin: true
        },
        '/logout': {
          target: env.VITE_API_URL,
          changeOrigin: true
        }
      }
    },
    build: {
      minify: 'terser'
    },
    define: {
      __VERSION__: JSON.stringify(new Date().toISOString()),
    }
  })
}