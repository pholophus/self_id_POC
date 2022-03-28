import { writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { model as profileModel } from '@datamodels/identity-profile-basic'
import { ModelManager } from '@glazed/devtools'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'

// if (!process.env.SEED) {
//   throw new Error('Missing SEED environment variable')
// }
const seed = new Uint8Array(32)
const CERAMIC_URL = process.env.CERAMIC_URL || 'https://ceramic-clay.3boxlabs.com'

// The seed must be provided as an environment variable
// const seed = fromString(process.env.SEED, 'base16') || 
// const seed = fromString('00000000B482A8C0', 'base16')
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(seed),
  resolver: getResolver(),
})
await did.authenticate()

// Connect to the Ceramic node
const ceramic = new CeramicClient(CERAMIC_URL)
ceramic.did = did

// Create a manager for the model
const manager = new ModelManager(ceramic)

// Add basicProfile to the model
manager.addJSONModel(profileModel)

// Create the schemas
const noteSchemaID = await manager.createSchema('Note', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Note',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date',
      maxLength: 30,
    },
    text: {
      type: 'string',
      title: 'text',
      maxLength: 4000,
    },
  },
})

const equipmentSchemaID = await manager.createSchema('Equipment', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Equipment',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date',
      maxLength: 30,
    },
    text: {
      type: 'string',
      title: 'attribute',
      maxLength: 4000,
    },
  },
})

const notesSchemaID = await manager.createSchema('Notes', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'NotesList',
  type: 'object',
  properties: {
    notes: {
      type: 'array',
      title: 'notes',
      items: {
        type: 'object',
        title: 'NoteItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(noteSchemaID)}`,
            type: 'string',
            pattern: '^ceramic://.+(\\?version=.+)?',
            maxLength: 150,
          },
          title: {
            type: 'string',
            title: 'title',
            maxLength: 100,
          },
        },
      },
    },
  },
})

const equipmentsSchemaID = await manager.createSchema('Equipments', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Equipments',
  type: 'object',
  properties: {
    equipments: {
      type: 'array',
      title: 'equipments',
      items: {
        type: 'object',
        title: 'EquipmentItem',
        properties: {
          id: {
            $comment: `cip88:ref:${manager.getSchemaURL(noteSchemaID)}`,
            type: 'string',
            pattern: '^ceramic://.+(\\?version=.+)?',
            maxLength: 150,
          },
          name: {
            type: 'string',
            title: 'name',
            maxLength: 100,
          },
        },
      },
    },
  },
})

// Create the definition using the created schema ID
await manager.createDefinition('notes', {
  name: 'notes',
  description: 'Simple text notes',
  schema: manager.getSchemaURL(notesSchemaID),
})

// Create the definition equipment using the created equipment schema ID
await manager.createDefinition('equipments', {
  name: 'equipments',
  description: 'Simple equipments list',
  schema: manager.getSchemaURL(equipmentsSchemaID),
})

// Create a Note with text that will be used as placeholder
await manager.createTile(
  'placeholderNote',
  { text: 'This is a placeholder for the note contents...' },
  { schema: manager.getSchemaURL(noteSchemaID) }
)

// Create an Equipment with attribute that will be used as placeholder
await manager.createTile(
  'placeholderEquipment',
  { attribute: 'This is a placeholder for the equipment contents...' },
  { schema: manager.getSchemaURL(equipmentSchemaID) }
)

// Write model to JSON file
await writeFile(new URL('model.json', import.meta.url), JSON.stringify(manager.toJSON()))
console.log('Encoded model written to scripts/model.json file')
