import { Pring, property } from "../pring"
import * as FirebaseFirestore from '@google-cloud/firestore'

export class Document extends Pring.Base {
    @property array: string[]                         = ["array"]
    // @property set: object                             = {"set": true}
    @property bool: boolean                           = true
    @property binary: Buffer                          = Buffer.from("data", 'utf8')
    @property file: Pring.File                        = new Pring.File("file.jpg", "https://file", "image/png")
    @property number: number                          = 9223372036854776000
    @property date: Date                              = new Date(100)
    @property geoPoint: FirebaseFirestore.GeoPoint    = new FirebaseFirestore.GeoPoint(0, 0)
    @property dictionary: object                      = {"key": "value"}  
    @property string: String                          = "string"
}
