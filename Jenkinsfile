node {
    checkout scm
    parallel(
    "Graphql Api": {
      dir('graphql-api') {
        stage('Build') {
            docker.image('node:9.3').inside {
                withEnv(['npm_config_cache=npm-cache']) {
                  sh 'npm install'
                }
            }
        }
        stage('ES Lint') {
          docker.image('node:9.3').inside {
              sh 'npm run lint'
          }
        }
        stage('Unit Tests') {
        docker.image('mysql:5.6').withRun('-e "MYSQL_ROOT_PASSWORD=root" -p 3306:3306') { c ->
              /* Wait until mysql service is up */
              docker.image('mysql:5.6').inside("--link ${c.id}:db") {
                /* Wait until mysql service is up */
                sh 'while ! mysqladmin ping -hdb --silent; do sleep 1; done'
              }
              /* Run some tests which require MySQL */
              docker.image('node:9.3').inside("--link ${c.id}:db") {
                  sh 'npm install'
                  sh 'npm list'
                  withEnv(['MYSQL_HOST=db',
                    'MYSQL_USER=root',
                    'MYSQL_PASSWORD=root']) {
                    sh 'npm test'
                  }
              }
          }
        }
      }
    },
    "Discord Client": {
      dir('discord-client') {
        stage('Build') {
            docker.image('node:9.3').inside {
                withEnv(['npm_config_cache=npm-cache']) {
                  sh 'npm install'
                }
            }
        }
        stage('ES Lint') {
          docker.image('node:9.3').inside {
              sh 'npm run lint'
          }
        }
        stage('Unit Tests') {
          docker.image('node:9.3').inside {
              sh 'npm test'
          }
        }
      }
    })
}
