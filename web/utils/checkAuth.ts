import { clientUser } from '../graphql'
import { MeQuery, MeDocument } from '../generated/graphql'
import { useEffect, useState } from 'react';

/**
 * 
 * @returns 
 */


export const checkAuth = () => {
  const [data, setData] = useState({} as MeQuery)

  useEffect(() => {
    clientUser.query({ query: MeDocument }).then(res => {
      setData(res.data);
    })
  }, [])
  

  return {
    data,
  }
}