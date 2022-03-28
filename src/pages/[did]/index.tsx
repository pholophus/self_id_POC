import type { RequestState } from '@self.id/framework'
import { Box, Heading, Paragraph } from 'grommet'
import type { GetServerSideProps } from 'next'

import NotesList from '../../components/NotesList'
import EquipmentsList from '../../components/EquipmentsList'
import { useNotesRecord, useEquipmentsRecord } from '../../hooks'

type Props = {
  did: string
  state: RequestState
}

export const getServerSideProps: GetServerSideProps<Props, { did: string }> = async (ctx) => {
  const did = ctx.params?.did
  if (did == null) {
    return {
      redirect: { destination: '/', permanent: true },
    }
  }

  const { getRequestState } = await import('../../server')
  return {
    props: { did, state: await getRequestState(ctx, did) },
  }
}

// export default function NotesPage({ did }: Props) {
//   const notesRecord = useNotesRecord(did)

//   const displayText = notesRecord.isLoading
//     ? 'Loading...'
//     : notesRecord.content?.notes?.length
//     ? 'Click on a note title to access its contents'
//     : 'No notes'

//   return (
//     <Box direction="row" flex>
//       <NotesList did={did} />
//       <Box direction="column" pad="medium">
//         <Heading margin={{ top: 'none' }}>Notes</Heading>
//         <Paragraph>{displayText}</Paragraph>
//       </Box>
//     </Box>
//   )
// }

export default function EquipmentsPage({ did }: Props) {
  const equipmentsRecord = useEquipmentsRecord(did)

  const displayName = equipmentsRecord.isLoading
    ? 'Loading...'
    : equipmentsRecord.content?.equipments?.length
    ? 'Click on an equipment to access its attributes'
    : 'No equipments'

  return (
    <Box direction="row" flex>
      <EquipmentsList did={did} />
      <Box direction="column" pad="medium">
        <Heading margin={{ top: 'none' }}>Equipments</Heading>
        <Paragraph>{displayName}</Paragraph>
      </Box>
    </Box>
  )
}
