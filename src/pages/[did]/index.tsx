import type { RequestState } from '@self.id/framework'
import { Avatar, Box, Button, DropButton, Text, Spinner, Heading, Paragraph } from 'grommet'
import type { GetServerSideProps } from 'next'
import Image from 'next/image'
import {
  AvatarPlaceholder,
  colors,
} from '@self.id/framework'
import { formatDID, getImageURL } from '@self.id/framework'
import NotesList from '../../components/NotesList'
import EquipmentsList from '../../components/EquipmentsList'
import { useNotesRecord, useEquipmentsRecord, useViewerProfile } from '../../hooks'
import {getProfileInfo} from '../../utils'
import { IPFS_URL } from '../../constants'
import styled, { css } from 'styled-components'

type Props = {
  did: string
  state: RequestState
}

type DisplayAvatarProps = {
  did?: string
  label: string
  loading?: boolean
  src?: string | null
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
  const profileRecord = useViewerProfile(did)
  // const avatar = getProfileInfo(did, profileRecord)
  const avatar = getImageURL(IPFS_URL, profileRecord.content?.image, { height: 150, width: 150 })

  const AvatarContainer = styled.div`
  width: 146px;
  height: 146px;
  background-color: ${colors.placeholder};
  border: 3px solid white;
  border-radius: 78px;
  margin-top: -78px;
`

  const displayName = equipmentsRecord.isLoading
    ? 'Loading...'
    : equipmentsRecord.content?.equipments?.length
    ? 'Click on an equipment to access its attributes'
    : 'No equipments'

    console.log(avatar)

  return (
    <Box direction="row" flex>
      <EquipmentsList did={did} />
      <Box direction="column" pad="medium">
        <Avatar size="32px" src={avatar} flex={false} />
        <Paragraph>{'DID : ' + did}</Paragraph>
        <Paragraph>{'Name : ' + profileRecord.content?.name}</Paragraph>
        <Heading margin={{ top: 'none' }}>Equipments</Heading>
        <Paragraph>{displayName}</Paragraph>
      </Box>
      
    </Box>
  )
}
