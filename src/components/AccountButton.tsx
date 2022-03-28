import { AvatarPlaceholder, useConnection, useViewerID, useViewerRecord } from '@self.id/framework'
import { Avatar, Box, Button, DropButton, Text, Spinner } from 'grommet'
import Link from 'next/link'
import { forwardRef, useCallback, useMemo, useState } from 'react'

import { getProfileInfo } from '../utils'
// import { formatDID, getImageURL } from '../utils'

import { profile } from 'console'
import { useRouter } from 'next/router'

type DisplayAvatarProps = {
  did?: string
  label: string
  loading?: boolean
  src?: string | null
}

function DisplayAvatar({ did, label, loading, src }: DisplayAvatarProps) {
  const avatar = loading ? (
    <Box pad="xxsmall">
      <Spinner />
    </Box>
  ) : src ? (
    <Avatar size="32px" src={src} flex={false} />
  ) : (
    <AvatarPlaceholder did={did} size={32} />
  )

  return (
    <Box
      border={{ color: 'neutral-5' }}
      direction="row"
      gap="small"
      pad="xxsmall"
      round="large"
      width="250px">
      {avatar}
      <Text alignSelf="center" size="medium" truncate weight="bold">
        {label}
      </Text>
    </Box>
  )
}

type MenuButtonProps = {
  label: string
  loading?: boolean
  onClick: () => void
}

function MenuButton({ label, ...props }: MenuButtonProps) {
  return (
    <Box pad="small">
      <Button
        alignSelf="start"
        label={
          <Text color="neutral-2" weight="bold">
            {label}
          </Text>
        }
        plain
        {...props}
      />
    </Box>
  )
}

export default function AccountButton() {
  const router = useRouter()
  const [connection, connect, disconnect] = useConnection()
  const viewerID = useViewerID()
  const profileRecord = useViewerRecord('basicProfile')
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isLoadingProfile, setLoadingProfile] = useState(false)

  console.log('profile')
  console.log(profileRecord.content)

  const toProfile = useCallback(
    (id: string | null) => {
      if (id != null) {
        if (router.route === '/[id]' && router.query.id === id) {
          // Already on wanted profile page
          setMenuOpen(false)
        } else {
          // Navigate to profile page
          setLoadingProfile(true)
          void router.push(`/${id}`).then(() => {
            setMenuOpen(false)
            setLoadingProfile(false)
          })
        }
      }
    },
    [router]
  )

  if (viewerID != null) {
    const { avatarSrc, displayName } = getProfileInfo(viewerID.id, profileRecord.content)

    const buttons =
      connection.status === 'connected' ? (
        <>
          <MenuButton
            label="Profile"
            loading={isLoadingProfile}
            onClick={() => toProfile(viewerID.id)}
          />
          <Link href="/me/profile/edit" passHref>
            <Button primary color="black" label="Edit" style={{ border: 0, color: 'white' }} />
          </Link>
          <MenuButton label="Disconnect" onClick={() => disconnect()} />
        </>
      ) : (
        <>
           <MenuButton
            label="Profile"
            loading={isLoadingProfile}
            onClick={() => toProfile(viewerID.id)}
          />
          <MenuButton
            label="Connect"
            onClick={() => {
              connect()
              setMenuOpen(false)
            }}
          />
          <MenuButton label="Clear" onClick={() => disconnect()} />
        </>
      )

    const content = (
      <Box
        border={{ color: 'neutral-5' }}
        margin={{ top: 'medium' }}
        round={{ size: 'small' }}
        width="250px">
        <Box
          align="center"
          background="neutral-6"
          gap="small"
          pad="medium"
          round={{ corner: 'top', size: 'small' }}>
          {avatarSrc ? (
            <Avatar size="60px" src={avatarSrc} />
          ) : (
            <AvatarPlaceholder did={viewerID.id} size={60} />
          )}
          <Text size="medium" truncate weight="bold">
            {displayName}
          </Text>
        </Box>
        <Box background="white" pad="small" round={{ corner: 'bottom', size: 'small' }}>
          <Box pad="small">
            <Link href={`/${viewerID.id}`} passHref>
              <Button
                alignSelf="start"
                label={
                  <Text color="neutral-2" weight="bold">
                    My equipments
                  </Text>
                }
                onClick={() => {
                  setMenuOpen(false)
                }}
                plain
              />
            </Link>
          </Box>
          {buttons}
        </Box>
      </Box>
    )

    return (
      <DropButton
        dropAlign={{ top: 'bottom', right: 'right' }}
        dropContent={content}
        dropProps={{ plain: true }}
        onClose={() => {
          setMenuOpen(false)
        }}
        onOpen={() => {
          setMenuOpen(true)
        }}
        open={isMenuOpen}>
        <DisplayAvatar
          did={viewerID.id}
          label={displayName}
          loading={profileRecord.isLoading}
          src={avatarSrc}
        />
      </DropButton>
    )
  }

  return connection.status === 'connecting' ? (
    <DisplayAvatar label="Connecting..." loading />
  ) : (
    <Button
      primary
      color="black"
      label="Connect"
      onClick={() => connect()}
      style={{ border: 0, color: 'white' }}
    />
  )
}
