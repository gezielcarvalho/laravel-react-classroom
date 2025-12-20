pipeline {
  agent any

  environment {
    # Registry and credential ids must be configured in Jenkins (Credentials)
    REGISTRY = "${REGISTRY ?: 'myregistry'}"
    API_IMAGE = "${REGISTRY}/laravel-classroom-api"
    FRONT_IMAGE = "${REGISTRY}/laravel-classroom-front"
  }

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: "${env.BUILD_NUMBER}", description: 'Tag to use for built images')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build API') {
      steps {
        sh "docker build -t ${API_IMAGE}:${params.IMAGE_TAG} ./api"
      }
    }

    stage('Build Frontend') {
      steps {
        sh "docker build -t ${FRONT_IMAGE}:${params.IMAGE_TAG} ./front"
      }
    }

    stage('Push Images') {
      steps {
        // credentialsId 'docker-registry-creds' must be created in Jenkins
        withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin ${REGISTRY}'
          sh "docker push ${API_IMAGE}:${params.IMAGE_TAG}"
          sh "docker push ${FRONT_IMAGE}:${params.IMAGE_TAG}"
        }
      }
    }

    stage('Deploy') {
      steps {
        // Assumes Jenkins runs on target server or has SSH setup; prefer running compose locally on the Jenkins host
        sh "cp docker/.env.production docker/.env.production.tmp || true"
        sh "docker compose -f docker-compose.prod.yml --env-file docker/.env.production pull"
        sh "docker compose -f docker-compose.prod.yml --env-file docker/.env.production up -d"
      }
    }

    stage('Migrate') {
      steps {
        sh "docker compose -f docker-compose.prod.yml --env-file docker/.env.production exec -T api php artisan migrate --force"
      }
    }

    stage('Smoke tests') {
      steps {
        sh "chmod +x scripts/qa-smoke-test.sh || true"
        sh "./scripts/qa-smoke-test.sh ${APP_URL ?: 'http://localhost'}"
      }
    }
  }

  post {
    success {
      echo 'Deploy succeeded'
    }
    failure {
      echo 'Deploy failed — inspect logs and roll back as necessary'
    }
  }
}
