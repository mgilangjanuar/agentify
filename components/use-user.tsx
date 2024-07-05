'use client'

import { AuthUser } from '@/app/api/_middlewares/authorization'
import { hit } from '@/lib/hit'
import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useState } from 'react'

export const UserContext = createContext<{
  user: AuthUser | null | undefined
  setUser: Dispatch<SetStateAction<AuthUser | null | undefined>>
  fetchUser: () => void
}>({
  user: undefined,
  setUser: () => {},
  fetchUser: () => {},
})

type UserProviderProps = {
  children: ReactNode
}

export function UserProvider({
  children,
  ...props
}: UserProviderProps) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)

  const fetchUser = useCallback(() => {
    hit('/api/auth/me').then(res => {
      if (res.ok) {
        res.json().then(setUser)
      } else {
        setUser(null)
      }
    }).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider {...props} value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
