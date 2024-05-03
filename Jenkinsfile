pipeline{
agent any
environment {
        registryCredentials = "nexus"
        registry = "192.168.33.10:8083"
        }
stages {
stage('Install dependencies') {
steps{
script {
sh('npm install --legacy-peer-deps')
}
}
}
stage('Unit Test') {
steps{
script {
sh('npm test')
}
}
}  
         stage('SonarQube Analysis') {
            steps {
                script {
                    // Define the SonarQube scanner tool
                   def scannerHome = tool 'sonar'

                   // Run the SonarQube scanner with specified parameters
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=Backend \
                       -Dsonar.sources=. \
                       -Dsonar.host.url=http://192.168.33.10:9000/ \
                        -Dsonar.login=9e48fc21a879ed761af39ddacc6511d60f326187
                    """
                }
            }
        }
stage('Build application') {
steps{
script {
sh('npm run build')
}
}
}
 stage('Building images (node and mongo)') {
            steps{
                script {
                    sh('docker-compose build')
                }
            }
        }/*
         stage('Deploy to Nexus') {
            steps{
                script {
                 docker.withRegistry("http://"+registry,registryCredentials ) {
                    sh('docker push $registry/nodemongoapp:6.0 ')
                             }
                        }
                }
        }*/
          stage('Run application ') {
            steps{ 
                script { 
                    sh('docker-compose up -d ')  
                } 
            } 
        }

        stage("Run Prometheus"){
            steps{
                script{
                    sh('docker start b53869c945f8')
                }
            }
        }

        stage("Run Grafana"){ 
            steps{
                script{
                    sh('docker start 661193540d0d')
                }
            }
        }       
}
}