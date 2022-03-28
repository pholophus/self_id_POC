import type { ModelTypeAliases } from '@glazed/types'
import type { BasicProfile } from '@datamodels/identity-profile-basic'

export type EditionState =
  | { status: 'pending' }
  | { status: 'loading' }
  | { status: 'failed'; error?: unknown }
  | { status: 'done'; notePage: string }
  | { status: 'done'; equipmentPage: string }


export type NoteForm = {
  text: string
  title: string
}

export type EquipmentForm = {
  attribute: string
  name: string
}

export type Note = {
  date: string
  text: string
}

export type Equipment = {
  date: string
  attribute: string
}

export type NoteItem = {
  id: string
  title: string
}

export type EquipmentItem = {
  id: string
  name: string
}

export type Equipments = {
  equipments: Array<EquipmentItem>
}

export type Notes = {
  notes: Array<NoteItem>
}

export type ModelTypes = ModelTypeAliases<
  {
    BasicProfile: BasicProfile
    Note: Note
    Notes: Notes
    Equipments: Equipments
    Equipment: Equipment
  },
  {
    basicProfile: 'BasicProfile'
    notes: 'Notes',
    equipments: 'Equipments'
    equipment: 'Equipment'
  },
  { 
    placeholderNote: 'Note',
    placeholderEquipment: 'Equipment'
  }
>
