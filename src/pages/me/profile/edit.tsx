import { Box } from 'grommet'
import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import Layout from '../../../components/Layout'

const EditProfileScreen = dynamic(() => import('../../../components/EditProfileScreen'), {
  ssr: false,
})

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { getRequestState } = await import('../../../server')
  return { props: { state: await getRequestState(ctx) } }
}

export default function EditProfilePage() {
  return (
    <div>
        <Head>
        <title>My profile | Self.ID</title>
      </Head>
      <Box alignSelf="center" margin="large" pad="medium" width="large">
        <EditProfileScreen />
      </Box>
    </div>
  )
}
