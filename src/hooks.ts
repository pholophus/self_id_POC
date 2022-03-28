import type { StreamMetadata } from '@ceramicnetwork/common'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import {
  PublicID,
  useConnection,
  useCore,
  usePublicRecord,
  useViewerID,
  useViewerRecord,
  uploadImage
} from '@self.id/framework'
import type { PublicRecord, SelfID, Dimensions, ImageSources } from '@self.id/framework'
import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useState, useRef} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { draftNoteAtom, draftEquipemtAtom, editionStateAtom } from './state'
import type { EditionState, ModelTypes, Note, Notes, Equipments, Equipment } from './types'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import type { ChangeEvent } from 'react'

import { IPFS_API_URL } from '../src/constants'

const UPLOAD_MAX_SIZE = 2500000

export type UploadState = 'idle' | 'uploading' | 'failed' | 'done'


export type ImageUploadOptions = {
  dimensions?: Array<Dimensions>
  maxSize?: number
}

export type TileDoc<ContentType> = {
  isLoading: boolean
  content?: ContentType
  metadata?: StreamMetadata
  isError: boolean
  error?: unknown
  isController: boolean
  isMutable: boolean
  isMutating: boolean
  update(content: ContentType): Promise<void>
}

export function useTileDoc<ContentType>(id: string): TileDoc<ContentType> {
  const queryClient = useQueryClient()
  const core = useCore()
  const viewerID = useViewerID()

  const {
    data: doc,
    isLoading,
    isError,
    error,
  } = useQuery<TileDocument<ContentType>>(
    id,
    async () => await core.tileLoader.load<ContentType>(id)
  )

  const isController = viewerID != null && doc?.metadata.controllers[0] === viewerID.id

  const updateMutation = useMutation(
    async (content: ContentType) => {
      if (viewerID == null || viewerID instanceof PublicID || doc == null) {
        throw new Error('Cannot mutate record')
      }
      await doc.update(content)
      return doc
    },
    {
      onSuccess: (doc: TileDocument<ContentType>) => {
        queryClient.setQueryData(id, doc)
      },
    }
  )

  return {
    content: doc?.content,
    metadata: doc?.metadata,
    error,
    isLoading,
    isError,
    isController,
    isMutable: isController && !(viewerID instanceof PublicID),
    isMutating: updateMutation.isLoading,
    update: async (content: ContentType) => {
      await updateMutation.mutateAsync(content)
    },
  }
}

export function useNotesRecord(did: string): PublicRecord<Notes | null> {
  return usePublicRecord<ModelTypes, 'notes'>('notes', did)
}

export function useEquipmentsRecord(did: string): PublicRecord<Equipments | null> {
  return usePublicRecord<ModelTypes, 'equipments'>('equipments', did)
}

export function useViewerProfile(): PublicRecord<BasicProfile | null> {
  return useViewerRecord('basicProfile')
}

// for receiving data from form
export function useDraftNote() {
  const connect = useConnection<ModelTypes>()[1]
  const notesRecord = useViewerRecord<ModelTypes, 'notes'>('notes')
  const [value, setValue] = useAtom(draftNoteAtom)
  const resetValue = useResetAtom(draftNoteAtom)
  const [state, setState] = useAtom(editionStateAtom)

  const isValid = value.text !== '' && value.title !== ''

  const publish = useCallback(async () => {
    if (!notesRecord.isLoadable || state.status === 'loading' || !isValid) {
      return false
    }
    setState({ status: 'loading' })

    try {
      const selfID = await connect()
      if (selfID == null) {
        setState({ status: 'pending' })
        return false
      }

      const doc = await selfID.client.dataModel.createTile('Note', {
        date: new Date().toISOString(),
        text: value.text,
      })

      const notes = notesRecord.content?.notes ?? []
      await notesRecord.set({ notes: [...notes, { id: doc.id.toUrl(), title: value.title }] })

      const notePage = `/${selfID.id}/${doc.id.toString()}`
      setState({ status: 'done', notePage })
      return notePage
    } catch (error) {
      setState({ status: 'failed', error })
    }
  }, [connect, isValid, state, setState, value])

  return { isValid, publish, resetValue, setValue, state, value }
}

export function useDraftEquipment() {
  const connect = useConnection<ModelTypes>()[1]
  // const notesRecord = useViewerRecord<ModelTypes, 'notes'>('notes')
  const equipmentsRecord = useViewerRecord<ModelTypes, 'equipments'>('equipments')
  // console.log(equipmentsRecord)
  const [value, setValue] = useAtom(draftEquipemtAtom)
  const resetValue = useResetAtom(draftEquipemtAtom)
  const [state, setState] = useAtom(editionStateAtom)

  const isValid = value.attribute !== '' && value.name !== ''

  const publish = useCallback(async () => {
    // if (!notesRecord.isLoadable || state.status === 'loading' || !isValid) {
    //   return false
    // }
    if (!equipmentsRecord.isLoadable || state.status === 'loading' || !isValid) {
        return false
    }

    setState({ status: 'loading' })

    try {
      const selfID = await connect()
      if (selfID == null) {
        setState({ status: 'pending' })
        return false
      }

      // const doc = await selfID.client.dataModel.createTile('Note', {
      //   date: new Date().toISOString(),
      //   text: value.text,
      // })

      const docEquip = await selfID.client.dataModel.createTile('Equipment', {
        date: new Date().toISOString(),
        attribute: value.attribute,
      })
      
      // const notes = notesRecord.content?.notes ?? []
      // await notesRecord.set({ notes: [...notes, { id: doc.id.toUrl(), title: value.title }] })

      const equipments = equipmentsRecord.content?.equipments ?? []
      await equipmentsRecord.set({ equipments: [...equipments, { id: docEquip.id.toUrl(), name: value.name }] })

      // const notePage = `/${selfID.id}/${docEquip.id.toString()}`
      const equipmentPage = `/${selfID.id}/${docEquip.id.toString()}`
      // setState({ status: 'done', notePage })
      // return notePage
      setState({ status: 'done', equipmentPage })
      return equipmentPage
    } catch (error) {
      setState({ status: 'failed', error })
    }
  }, [connect, isValid, state, setState, value])

  return { isValid, publish, resetValue, setValue, state, value }
}

export function useNote(did: string, id: string) {
  const connect = useConnection<ModelTypes>()[1]
  const notesRecord = useNotesRecord(did)
  const noteDoc = useTileDoc<Note>(id)
  const [editingText, setEditingText] = useState<string>('')
  const [editionState, setEditionState] = useState<EditionState | null>(null)

  const isValid = editingText !== ''
  const noteItem = notesRecord.content?.notes.find((item) => item.id === `ceramic://${id}`)
  const content =
    noteDoc.content == null || noteItem == null
      ? null
      : { title: noteItem.title, text: noteDoc.content.text }
  const isEditable = content != null && noteDoc.isController
  const isEditing = editionState != null

  const resetEditingText = useCallback(() => {
    setEditingText(content?.text ?? '')
  }, [content])

  const toggleEditing = useCallback(
    (editing: boolean = !isEditing) => {
      if (editing) {
        resetEditingText()
        setEditionState({ status: 'pending' })
      } else {
        setEditionState(null)
      }
    },
    [isEditing, resetEditingText, setEditionState]
  )

  const update = useCallback(async () => {
    if (
      noteDoc.content == null ||
      editionState == null ||
      editionState.status === 'loading' ||
      !isValid
    ) {
      return false
    }
    setEditionState({ status: 'loading' })

    try {
      const selfID = await connect()
      if (selfID == null) {
        setEditionState({ status: 'pending' })
        return false
      }

      if (editingText !== noteDoc.content.text) {
        await noteDoc.update({ ...noteDoc.content, text: editingText })
      }
      setEditionState(null)
    } catch (error) {
      setEditionState({ status: 'failed', error })
    }
  }, [connect, editionState, isValid, editingText, noteDoc, setEditionState])

  return {
    isEditable,
    isEditing,
    isError: notesRecord.isError || noteDoc.isError,
    isLoading: notesRecord.isLoading || noteDoc.isLoading,
    isMutable: noteDoc.isMutable,
    isMutating: noteDoc.isMutating,
    isValid,
    content,
    editingText,
    error: notesRecord.error ?? noteDoc.error,
    resetEditingText,
    setEditingText,
    toggleEditing,
    update,
  }
}

export function useEquipment(did: string, id: string) {
  const connect = useConnection<ModelTypes>()[1]
  // const notesRecord = useNotesRecord(did)
  const equipmentsRecord = useEquipmentsRecord(did)
  // const noteDoc = useTileDoc<Note>(id)
  const equipmentDoc = useTileDoc<Equipment>(id)
  // const [editingText, setEditingText] = useState<string>('')
  const [editingEquipment, setEditingEquipment] = useState<string>('')
  const [editionState, setEditionState] = useState<EditionState | null>(null)

  const isValid = editingEquipment !== ''
  // const noteItem = notesRecord.content?.notes.find((item) => item.id === `ceramic://${id}`)
  const equipmentItem = equipmentsRecord.content?.equipments.find((item) => item.id === `ceramic://${id}`)
  // const content =
  //   noteDoc.content == null || noteItem == null
  //     ? null
  //     : { title: noteItem.title, text: noteDoc.content.text }
  const content =
  equipmentDoc.content == null || equipmentItem == null
    ? null
    : { name: equipmentItem.name, attribute: equipmentDoc.content.attribute }
  const isEditable = content != null && equipmentDoc.isController
  const isEditing = editionState != null

  const resetEditingEquipment = useCallback(() => {
    setEditingEquipment(content?.attribute ?? '')
  }, [content])

  const toggleEditing = useCallback(
    (editing: boolean = !isEditing) => {
      if (editing) {
        resetEditingEquipment()
        setEditionState({ status: 'pending' })
      } else {
        setEditionState(null)
      }
    },
    [isEditing, resetEditingEquipment, setEditionState]
  )

  const update = useCallback(async () => {
    if (
      equipmentDoc.content == null ||
      editionState == null ||
      editionState.status === 'loading' ||
      !isValid
    ) {
      return false
    }
    setEditionState({ status: 'loading' })

    try {
      const selfID = await connect()
      if (selfID == null) {
        setEditionState({ status: 'pending' })
        return false
      }

      if (editingEquipment !== equipmentDoc.content.attribute) {
        await equipmentDoc.update({ ...equipmentDoc.content, attribute: editingEquipment })
      }
      setEditionState(null)
    } catch (error) {
      setEditionState({ status: 'failed', error })
    }
  }, [connect, editionState, isValid, editingEquipment, equipmentDoc, setEditionState])

  console.log('update')
  console.log(equipmentDoc)
  console.log('record')
  console.log(equipmentsRecord)
  return {
    isEditable,
    isEditing,
    isError: equipmentsRecord.isError || equipmentDoc.isError,
    isLoading: equipmentsRecord.isLoading || equipmentDoc.isLoading,
    isMutable: equipmentDoc.isMutable,
    isMutating: equipmentDoc.isMutating,
    isValid,
    content,
    editingEquipment,
    error: equipmentsRecord.error ?? equipmentDoc.error,
    resetEditingEquipment,
    setEditingEquipment,
    toggleEditing,
    update,
  }
}


export function useLogin(): (switchAccount?: boolean) => Promise<SelfID | null> {
  const connect = useConnection()[1]
  return useCallback(
    async (switchAccount?: boolean): Promise<SelfID | null> => {
      return await connect({ switchAccount })
    },
    [connect]
  )
}

export function useLogout() {
  return useConnection()[2]
}

export function useEditProfile(): [boolean, (profile: BasicProfile) => Promise<void>] {
  const profileRecord = useViewerRecord('basicProfile')

  const editProfile = useCallback(
    async (profile: BasicProfile) => {
      if (!profileRecord.isMutable || profileRecord.isMutating) {
        return
      }

      try {
        await toast.promise(profileRecord.set(profile), {
          loading: 'Saving profile...',
          success: 'Profile successfully saved!',
          error: 'Failed to save profile',
        })
      } catch (error) {
        console.warn('Failed to save profile', error)
      }
    },
    [profileRecord]
  )

  return [profileRecord.isMutating, editProfile]
}

// export function useImageUpload(
//   onUpload: (sources: ImageSources) => void,
//   options: ImageUploadOptions = {}
// ) {
//   const maxSize = options.maxSize ?? UPLOAD_MAX_SIZE
//   const [state, setState] = useState<UploadState>('idle')
//   const sourcesRef = useRef<ImageSources | null>(null)
//   const inputRef = useRef<HTMLInputElement>(null)

//   function resetInput() {
//     if (inputRef.current != null) {
//       inputRef.current.value = ''
//     }
//   }

//   const trigger = useCallback(() => {
//     inputRef.current?.click()
//   }, [])

//   const onChange = useCallback(
//     (e: ChangeEvent<HTMLInputElement>) => {
//       sourcesRef.current = null

//       const file = e.target?.files?.[0]
//       if (file == null || file.size > maxSize) {
//         toast.error('Selected image exceeds maximum allowed size')
//         resetInput()
//         return
//       }

//       setState('uploading')

//       uploadImage(IPFS_API_URL, file, options.dimensions).then(
//         (imageSources) => {
//           resetInput()
//           sourcesRef.current = imageSources
//           onUpload(imageSources)
//           setState('done')
//         },
//         (err) => {
//           console.warn('Failed to upload image to IPFS', err)
//           setState('failed')
//         }
//       )
//     },
//     [maxSize, options.dimensions, onUpload]
//   )

//   const input = (
//     <input
//       accept="image/png, image/jpeg"
//       onChange={onChange}
//       ref={inputRef}
//       style={{ display: 'none' }}
//       type="file"
//     />
//   )

//   return { input, state, trigger, value: sourcesRef.current }
// }
