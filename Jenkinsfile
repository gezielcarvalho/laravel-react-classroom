pipeline {
  agent any

  stages {
    stage('Hello World') {
      steps {
        echo 'Hello World! Webhook triggered successfully.'
        echo "Branch: ${env.BRANCH_NAME}"
        echo "Build Number: ${env.BUILD_NUMBER}"
      }
    }
  }

  post {
    success {
      echo 'Integration test succeeded'
    }
    failure {
      echo 'Integration test failed'
    }
  }
}
