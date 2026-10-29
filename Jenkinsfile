// Alternative pipeline for Jenkins (same stages as the GitHub Actions workflow)
pipeline {
  agent any
  environment { IMAGE = "yourdockerhubuser/cicd-demo-app:${env.BUILD_NUMBER}" }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install')  { steps { sh 'npm install' } }
    stage('Lint')     { steps { sh 'npm run lint' } }
    stage('Test')     { steps { sh 'npm test' } }
    stage('Security') { steps { sh 'npm audit --omit=dev --audit-level=high' } }
    stage('Docker Build') { steps { sh 'docker build -t $IMAGE .' } }
    stage('Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'U', passwordVariable: 'P')]) {
          sh 'echo $P | docker login -u $U --password-stdin && docker push $IMAGE'
        }
      }
    }
    stage('Deploy Staging') { steps { sh './scripts/deploy.sh $IMAGE app-staging 8080' } }
    stage('Approval') { steps { input message: 'Deploy to production?' } }
    stage('Deploy Production') { steps { sh './scripts/deploy.sh $IMAGE app-prod 80' } }
  }
  post {
    failure { echo 'Pipeline failed - notify the team (Slack/email).' }
  }
}
