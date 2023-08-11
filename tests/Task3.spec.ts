import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, beginCell, toNano } from 'ton-core'
import { Task3 } from '../wrappers/Task3'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task3', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task3')
    })

    let blockchain: Blockchain
    let task3: SandboxContract<Task3>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task3 = blockchain.openContract(Task3.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task3 are ready to use
    })

    it('should find and replace like the example provided', async () => {
        const flag = 0b101110101n
        const value = 0b111111111n
        const linkedList = beginCell()
            .storeUint(0, 256)
            .storeUint(1, 256)
            .storeUint(2, 256)
            .storeUint(3, 244)
            .storeUint(0b10100001011, 11)
            .storeRef(beginCell().storeUint(0b10101000111111, 14))
            .endCell()
        const result = await task3.getFindAndReplace(flag, value, linkedList)
        let s = result.beginParse()
        expect(s.loadUintBig(256) === 0n).toBeTruthy()
        expect(s.loadUintBig(256) === 1n).toBeTruthy()
        expect(s.loadUintBig(256) === 2n).toBeTruthy()
        expect(s.loadUintBig(244) === 3n).toBeTruthy()
        expect(s.loadUintBig(7) === 0b1010000n).toBeTruthy()
        expect(s.remainingBits === 0).toBeTruthy()
        s = s.loadRef().beginParse()
        expect(s.loadUintBig(9) === value).toBeTruthy()
        expect(s.loadUintBig(9) === 0b000111111n).toBeTruthy()
        expect(s.remainingBits === 0).toBeTruthy()
    })
})
