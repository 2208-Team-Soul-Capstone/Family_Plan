import { useNavigation } from '@react-navigation/native';
import BottomNav from './BottomNav';


const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <>
      <BottomNav />
    </>
  );
};

export default HomeScreen;
