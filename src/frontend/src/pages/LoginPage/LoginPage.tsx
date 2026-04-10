import { LoginForm } from '../../features/Auth/ui/LoginForm';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  return (
    <div className={styles.pageContainer}>
      <LoginForm />
    </div>
  );
};
