pipeline{
agent any
stages {
stage('Install dependencies') {
steps{
script {
sh('npm install --legacy-peer-deps')
}
}
}
/*stage('Unit Test') {
steps{
script {
sh('npm test')
}
}
}*/
stage('Build application') {
steps{
script {
sh('npm run build')
}
}
}
}
}