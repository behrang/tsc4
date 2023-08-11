import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, beginCell, toNano } from 'ton-core'
import { Task4 } from '../wrappers/Task4'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task4', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task4')
    })

    let blockchain: Blockchain
    let task4: SandboxContract<Task4>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task4 = blockchain.openContract(Task4.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    })

    it('should encrypt a message', async () => {
        const plain = 'If he had anything confidential to say, he wrote it in cipher, that is, by so changing the order of the letters of the alphabet, that not a word could be made out.'
        const cipher = 'Pm ol ohk hufaopun jvumpkluaphs av zhf, ol dyval pa pu jpwoly, aoha pz, if zv johunpun aol vykly vm aol slaalyz vm aol hswohila, aoha uva h dvyk jvbsk il thkl vba.'
        const text = beginCell()
            .storeUint(0, 32)
            .storeStringTail(plain)
            .endCell()
        const expected = beginCell()
            .storeUint(0, 32)
            .storeStringTail(cipher)
            .endCell()
        const result = await task4.getCaesarCipherEncrypt(7n, text)
        expect(result.hash().toString() === expected.hash().toString()).toBeTruthy()
    })

    it('should decrypt a message', async () => {
        const plain = 'If he had anything confidential to say, he wrote it in cipher, that is, by so changing the order of the letters of the alphabet, that not a word could be made out.'
        const cipher = 'Pm ol ohk hufaopun jvumpkluaphs av zhf, ol dyval pa pu jpwoly, aoha pz, if zv johunpun aol vykly vm aol slaalyz vm aol hswohila, aoha uva h dvyk jvbsk il thkl vba.'
        const text = beginCell()
            .storeUint(0, 32)
            .storeStringTail(cipher)
            .endCell()
        const expected = beginCell()
            .storeUint(0, 32)
            .storeStringTail(plain)
            .endCell()
        const result = await task4.getCaesarCipherDecrypt(7n, text)
        expect(result.hash().toString() === expected.hash().toString()).toBeTruthy()
    })
})
