import { useViewerID } from '@self.id/framework'
import { Box, Button, Form, FormField, Text, TextArea, TextInput } from 'grommet'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

import NotesList from '../components/NotesList'
import EquipmentsList from '../components/EquipmentsList'
import { useDraftNote, useDraftEquipment } from '../hooks'

export default function NewNotePage() {
  const draft = useDraftNote()
  const equipDraft = useDraftEquipment()
  const viewer = useViewerID()
  const router = useRouter()

  const isLoading = draft.state.status === 'loading'
  const isLoadingEquipment = draft.state.status === 'loading'

  const onSubmit = useCallback(async () => {
    const notePage = await draft.publish()
    if (notePage) {
      await router.push(notePage)
    }
  }, [draft, router])

  const onSubmitEquip = useCallback(async () => {
    const equipPage = await equipDraft.publish()
    if (equipPage) {
      await router.push(equipPage)
    }
  }, [equipDraft, router])

  // const sidebar = viewer ? (
  //   <NotesList did={viewer.id} />
  // ) : (
  //   <Box direction="column" width="medium" pad="medium">
  //     <Text>Not connected</Text>
  //   </Box>
  // )

  const sidebar = viewer ? (
    <EquipmentsList did={viewer.id} />
  ) : (
    <Box direction="column" width="medium" pad="medium">
      <Text>Not connected</Text>
    </Box>
  )

  return (
    // <Box direction="row" flex>
    //   {sidebar}
    //   <Box direction="column" flex pad="medium">
    //     <Form
    //       value={draft.value}
    //       onChange={(nextValue) => draft.setValue(nextValue)}
    //       onReset={() => draft.resetValue()}
    //       onSubmit={onSubmit}>
    //       <FormField name="title" htmlFor="text-input-title" label="Title">
    //         <TextInput autoFocus disabled={isLoading} id="text-input-title" name="title" />
    //       </FormField>
    //       <FormField name="text" htmlFor="text-input-text" label="Contents">
    //         <TextArea disabled={isLoading} id="text-input-text" name="text" />
    //       </FormField>
    //       <Box direction="row" gap="medium">
    //         <Button
    //           disabled={!draft.isValid || isLoading}
    //           type="submit"
    //           primary
    //           style={{ color: 'white' }}
    //           label={isLoading ? 'Publishing...' : 'Publish note'}
    //         />
    //         <Button disabled={isLoading} type="reset" label="Reset" />
    //       </Box>
    //     </Form>
    //   </Box>
    // </Box>

    <Box direction="row" flex>
    {sidebar}
    <Box direction="column" flex pad="medium">
      <Form
        value={equipDraft.value}
        onChange={(nextValue) => equipDraft.setValue(nextValue)}
        onReset={() => equipDraft.resetValue()}
        onSubmit={onSubmitEquip}>
        <FormField name="name" htmlFor="text-input-title" label="Equipment Name">
          <TextInput autoFocus disabled={isLoadingEquipment} id="text-input-title" name="name" />
        </FormField>
        <FormField name="attribute" htmlFor="text-input-text" label="Attribute">
          <TextArea disabled={isLoadingEquipment} id="text-input-text" name="attribute" />
        </FormField>
        <Box direction="row" gap="medium">
          <Button
            disabled={!equipDraft.isValid || isLoadingEquipment}
            type="submit"
            primary
            style={{ color: 'white' }}
            label={isLoadingEquipment ? 'Publishing...' : 'Publish equipment'}
          />
          <Button disabled={isLoadingEquipment} type="reset" label="Reset" />
        </Box>
      </Form>
    </Box>
    </Box>
  )
}

