import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import type { EditionState, NoteForm, EquipmentForm } from './types'

// export const draftNoteAtom = atomWithReset<NoteForm>({ text: '', title: '' })
export const draftNoteAtom = atomWithReset<NoteForm>({ text: '', title: '' })

export const draftEquipemtAtom = atomWithReset<EquipmentForm>({ attribute: '', name: '' })

export const editionStateAtom = atom<EditionState>({ status: 'pending' })
