import { useQuery } from '@tanstack/react-query';
import { FileRepository } from '@amityco/ts-sdk-react-native';

const useFile = <T extends Amity.FileType = 'image'>(fileId?: string) => {
  const { data } = useQuery({
    queryKey: ['asc-uikit', 'FileRepository', 'getFile', fileId],
    queryFn: () => FileRepository.getFile<T>(fileId),
    enabled: !!fileId,
    select: (response) => response.data,
  });

  return data;
};

export default useFile;
