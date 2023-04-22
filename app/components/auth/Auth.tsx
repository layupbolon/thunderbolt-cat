'use client';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_STORAGE_KEY } from '../../constant';
import { getUserByToken } from '../../aigc-tools-requests';

interface Props {}

export const Auth: React.FC<Props> = ({}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storageToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storageToken) {
      setModalVisible(true);
    }
    // else {
    //   getUserByToken().then((res) => {
    //     console.log('res: ', res);
    //   });
    // }
  }, []);

  return (
    <Modal
      isOpen={modalVisible}
      onClose={() => setModalVisible(false)}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>提醒</ModalHeader>
        <ModalBody>
          <p>请先登录，登录后获得免费提问次数</p>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              router.push('/login');
            }}
          >
            去登录
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
