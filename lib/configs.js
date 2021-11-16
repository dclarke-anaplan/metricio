import { readFileSync } from 'fs';
import { resolve } from 'path'

export function getKubeConfigContent(kcFileName){
    return readFileSync(resolve(__dirname, `../config/kubeconfig/${kcFileName}`), 'utf8')
}