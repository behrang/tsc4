import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, beginCell, toNano } from 'ton-core'
import { Task1 } from '../wrappers/Task1'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task1', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task1')
    })

    let blockchain: Blockchain
    let task1: SandboxContract<Task1>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task1 = blockchain.openContract(Task1.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    })

    it('should find the root empty cell', async () => {
        const tree = beginCell()
            .endCell()
        const hash = tree.hash()
        const result = await task1.getFindBranchByHash(hash, tree)
        expect(result.hash().equals(tree.hash())).toBeTruthy()
    })

    it('should find a subtree', async () => {
        const subtree = beginCell()
            .storeUint(1, 256)
            .storeRef(beginCell().storeUint(2, 256).storeRef(beginCell().storeUint(3,256)))
            .endCell()
        const tree = beginCell()
            .storeRef(beginCell())
            .storeRef(beginCell())
            .storeRef(beginCell().storeRef(subtree))
            .endCell()
        const hash = subtree.hash()
        const result = await task1.getFindBranchByHash(hash, tree)
        expect(result.hash().equals(subtree.hash())).toBeTruthy()
    })

    it('should return empty cell when not found', async () => {
        const subtree = beginCell()
            .storeUint(1, 256)
            .storeRef(beginCell().storeUint(2, 256).storeRef(beginCell().storeUint(3,256)))
            .endCell()
        const tree = beginCell()
            .storeRef(beginCell())
            .storeRef(beginCell())
            .storeRef(beginCell().storeRef(subtree))
            .endCell()
        const hash = beginCell().storeUint(0, 256).endCell().hash()
        const result = await task1.getFindBranchByHash(hash, tree)
        expect(result.hash().equals(beginCell().endCell().hash())).toBeTruthy()
    })
})
