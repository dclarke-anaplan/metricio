import {CoreV1Api,KubeConfig} from '@kubernetes/client-node'
import config from "../../../config";

export const interval = '*/1 * * * *';

// To use this, put something like this in `config/index.js`
//  kubeconfig:{
//    $gke-project: getKubeConfigContent('$gke-project')
//  },
// which will load a `kubeconfig` file called `$gke-project` from
// the `kubeconfig` subfolder on the `config` directory.
//
// You can then use whatever widget you like to display the results - this example
//  would go best with a multi value widget.
export const perform = async () => {
    const kc = new KubeConfig();
    kc.loadFromString(config.kubeconfig.$gke-project);

    const k8sApi = kc.makeApiClient(CoreV1Api);

    let nodeSize = await k8sApi.listNode().then((res) => {
        return res.body.items.length
    });

    let podsSize = await k8sApi.listPodForAllNamespaces().then((res) => {
        return res.body.items.length
    });

    let namespacesSize = await k8sApi.listNamespace().then((res) => {
        return res.body.items.length
    });

    return [
        {
            target: 'Widget-gke-cluster', // Name of widget in dashboard to update
            data: {
                value: {
                    Nodes: nodeSize,
                    Pods: podsSize,
                    NameSpaces: namespacesSize,
                },
            },
        },
    ];
};