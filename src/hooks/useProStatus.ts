import { useProStatusContext } from '@/context/ProStatusContext';

export function useProStatus(): [boolean, (val: boolean) => void] {
  const { isPro, setPro } = useProStatusContext();
  return [isPro, setPro];
}
