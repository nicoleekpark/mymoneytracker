export type Migration = {
  id: number
  name: string
  up: () => void
}