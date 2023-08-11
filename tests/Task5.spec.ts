import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, TupleItem, toNano } from 'ton-core'
import { Task5 } from '../wrappers/Task5'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task5', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task5')
    })

    let blockchain: Blockchain
    let task5: SandboxContract<Task5>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task5 = blockchain.openContract(Task5.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task5 are ready to use
    })

    it('should return the first sequence in example', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(1n, 3n))
        expect(result).toHaveLength(3)
        expect(result[0] === 1n).toBeTruthy()
        expect(result[1] === 1n).toBeTruthy()
        expect(result[2] === 2n).toBeTruthy()
    })

    it('should return the second sequence in example', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(201n, 4n))
        expect(result).toHaveLength(4)
        expect(result[0] === 453973694165307953197296969697410619233826n).toBeTruthy()
        expect(result[1] === 734544867157818093234908902110449296423351n).toBeTruthy()
        expect(result[2] === 1188518561323126046432205871807859915657177n).toBeTruthy()
        expect(result[3] === 1923063428480944139667114773918309212080528n).toBeTruthy()
    })

    it('should work for N=370 K=0', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(370n, 0n))
        expect(result).toHaveLength(0)
    })

    it('should work for N=0 K=1', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(0n, 1n))
        expect(result).toHaveLength(1)
        expect(result[0] === 0n).toBeTruthy()
    })

    it('should work for N=0 K=2', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(0n, 2n))
        expect(result).toHaveLength(2)
        expect(result[0] === 0n).toBeTruthy()
        expect(result[1] === 1n).toBeTruthy()
    })

    it('should work for N=1 K=1', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(1n, 1n))
        expect(result).toHaveLength(1)
        expect(result[0] === 1n).toBeTruthy()
    })

    it('should work for N=1 K=2', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(1n, 2n))
        expect(result).toHaveLength(2)
        expect(result[0] === 1n).toBeTruthy()
        expect(result[1] === 1n).toBeTruthy()
    })

    it('should work for N=2 K=3', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(2n, 3n))
        expect(result).toHaveLength(3)
        expect(result[0] === 1n).toBeTruthy()
        expect(result[1] === 2n).toBeTruthy()
        expect(result[2] === 3n).toBeTruthy()
    })

    it('should work for N=3 K=3', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(3n, 3n))
        expect(result).toHaveLength(3)
        expect(result[0] === 2n).toBeTruthy()
        expect(result[1] === 3n).toBeTruthy()
        expect(result[2] === 5n).toBeTruthy()
    })

    it('should work for N=370 K=1', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(370n, 1n))
        expect(result).toHaveLength(1)
        expect(result[0] === 94611056096305838013295371573764256526437182762229865607320618320601813254535n).toBeTruthy()
    })

    it('should work for N=116 K=255', async () => {
        const result = fromTuple(await task5.getFibonacciSequence(116n, 255n))
        expect(result).toHaveLength(255)
        expect(result[254] === 94611056096305838013295371573764256526437182762229865607320618320601813254535n).toBeTruthy()
    })
})

function fromTuple(input: TupleItem[]): bigint[] {
    const result: bigint[] = []
    for (let i = 0; i < input.length; i += 1) {
        const item = input[i]
        if (item.type !== 'int') {
            throw 'expected an int'
        }
        result.push(item.value)
    }
    return result
}
