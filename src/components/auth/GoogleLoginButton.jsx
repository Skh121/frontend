import { GoogleLogin } from '@react-oauth/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authAPI from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const GoogleLoginButton = ({ onError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const { clearCart } = useCartStore();

  const googleAuthMutation = useMutation({
    mutationFn: authAPI.googleAuth,
    onSuccess: (response) => {
      // Clear previous session data
      queryClient.clear();
      clearCart();
      setUser(response.data.user);
      toast.success('Login successful!');
      if (response.data.user.role && response.data.user.role.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Google login failed. Please try again.';
      toast.error(message);
      if (onError) onError(message);
    },
  });

  const handleGoogleSuccess = (credentialResponse) => {
    googleAuthMutation.mutate(credentialResponse.credential);
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
    if (onError) onError('Google login failed');
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleLoginButton;

