import { } from "reflect-metadata"
import { BatchType, Batch } from './batch'
import { firestore, timestamp } from './index'
import { SubCollection } from './subCollection'
import {
    Base,
    DocumentSnapshot,
    QuerySnapshot,
    WriteBatch,
    DocumentData,
    DocumentReference,
} from './base'

export class ReferenceCollection<T extends Base> extends SubCollection<T> {

    public nsert(newMember: T) {
        this.objects.push(newMember)
        if (this.isSaved()) {
            this._insertions.push(newMember)
        }
    }

    public delete(member: T) {
        this.objects.some((v, i) => {
            if (v.id === member.id) {
                this.objects.splice(i, 1)
                return true
            }
            return false
        })
        if (this.isSaved()) {
            this._deletions.push(member)
        }
    }

    public pack(type: BatchType, batchID?: string, writeBatch?: WriteBatch): WriteBatch {
        const _writeBatch: WriteBatch = writeBatch || firestore.batch()
        const _batch: Batch = new Batch(_writeBatch)
        switch (type) {
            case BatchType.save: {
                this.forEach(document => {
                    let value: DocumentData = {}
                    if (document.shouldBeReplicated()) {
                        value = document.value()
                    }
                    value.createdAt = timestamp
                    value.updatedAt = timestamp
                    if (!document.isSaved) {
                        _batch.set(document.getReference(), document.value(), {merge: true})
                    }
                    const reference = this.reference.doc(document.id)
                    _batch.set(reference, value, { merge: true})
                })
                return _batch.batch()
            }
            case BatchType.update:
                const insertions = this._insertions.filter(item => this._deletions.indexOf(item) < 0)
                insertions.forEach(document => {
                    let value: DocumentData = {}
                    if (document.isSaved) {
                        if (document.shouldBeReplicated()) {
                            value = document.value()
                        }
                        if (document.createdAt) {
                            value.createdAt = document.createdAt
                        }
                        value.updatedAt = timestamp
                        _batch.set(document.getReference(), document.value(), { merge: true})
                    } else {
                        if (document.shouldBeReplicated()) {
                            value = document.value()
                        }
                        value.createdAt = timestamp
                        value.updatedAt = timestamp
                    }
                    const reference = this.reference.doc(document.id)
                    _batch.set(reference, value, { merge: true})
                })
                const deletions = this._deletions.filter(item => this._insertions.indexOf(item) < 0)
                deletions.forEach(document => {
                    const reference = this.reference.doc(document.id)
                    _batch.delete(reference)
                })
                return _batch.batch()
            case BatchType.delete:
                this.forEach(document => {
                    const reference = this.reference.doc(document.id)
                    _batch.delete(reference)
                })
                return _batch.batch()
        }
    }

    public async doc(id: string, type: { new(id?: string, data?: DocumentData): T; }) {
        try {
            const document: T = new type(id, {})
            await document.fetch()
            return document
        } catch (error) {
            throw error
        }
    }

    public async get(type: { new(id?: string, data?: DocumentData): T; }) {
        try {
            const snapshot: QuerySnapshot = await this.reference.get()
            const docs: DocumentSnapshot[] = snapshot.docs
            const documents: T[] = docs.map((documentSnapshot) => {
                const document: T = new type(documentSnapshot.id, {})
                return document
            })
            this.objects = documents
            return documents
        } catch (error) {
            throw error
        }
    }
}
