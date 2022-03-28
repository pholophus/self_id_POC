import { AvatarPlaceholder, usePublicRecord } from '@self.id/framework'
import { Anchor, Avatar, Box, Nav, Text } from 'grommet'
import Link from 'next/link'

import { useNotesRecord, useEquipmentsRecord } from '../hooks'
import { getProfileInfo } from '../utils'

type Props = {
  did: string
  active?: string
}

export default function EquipmentsList({ active, did }: Props) {
  const profileRecord = usePublicRecord('basicProfile', did)
  const equipmentsRecord = useEquipmentsRecord(did)

  const profile = getProfileInfo(did, profileRecord.content)

  console.log(profile);
  const avatar = profile.avatarSrc ? (
    <Avatar size="32px" src={profile.avatarSrc} flex={false} />
  ) : (
    <AvatarPlaceholder did={did} size={32} />
  )

  const equipments = equipmentsRecord.content?.equipments ?? []
  const items = equipments.map((equipment) => {
    const id = equipment.id.replace('ceramic://', '')
    const link =
      id === active ? (
        <Text color="brand">{equipment.name}</Text>
      ) : (
      <Link href={`/${did}/${id}`}><span><h4>{equipment.name}</h4><span style={{fontSize:10}}>{id}</span></span></Link>
      )
    return (
      <Box key={id} border={{ color: 'brand', side: 'bottom' }} pad="small">
        {link}
      </Box>
    )
  })

  return (
    <Box fill="vertical" overflow="vertical" width="medium" pad="medium">
      <Box
        border={{ color: 'brand', side: 'bottom' }}
        direction="row"
        gap="small"
        pad={{ bottom: 'small' }}>
        {avatar}
        <Link href={`/${did}`} passHref>
          <Anchor>
            <Text alignSelf="center" size="medium" truncate weight="bold">
              {profile.displayName}
              {"'"}s equipments
            </Text>
          </Anchor>
        </Link>
      </Box>
      <Nav direction="column" gap="none">
        {items}
      </Nav>
    </Box>
  )
}
