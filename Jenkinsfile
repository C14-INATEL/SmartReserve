pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {

        stage('Backend - Instalar Dependências') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Backend - Rodar Testes') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Frontend - Instalar Dependências') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executado com sucesso!'
        }

        failure {
            echo 'Pipeline falhou!'
        }
    }
}