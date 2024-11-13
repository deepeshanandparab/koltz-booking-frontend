import axios from "axios";
// import { persistor } from "../store";


////////////////////////// AUTH - Action Creator //////////////////////////

export const login = (data) => {
  return {
    type: "LOGIN",
    payload: data,
  };
};

export const logout = () => {
  // alert();
  return {
    type: "LOGOUT",
    payload: null,
  };
};
  

////////////////////////// AUTH - Action //////////////////////////

export const Login = async (data) => {
    console.log("process.env.BACKEND_API_URL", process.env.BACKEND_API_URL)
    try {
        const response = await axios.post(process.env.BACKEND_API_URL+'/account/login/', data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("Response login---------", response);
        if (response.status === 200 ) {
            console.log("response.data.user --------", response.data.user.name)
            localStorage.setItem('token', response.data.token);
            if(response.data.user){
              localStorage.setItem('name', response.data.user.name);
              localStorage.setItem('id', response.data.user.id);
              localStorage.setItem('profile_picture', response.data.user.picture);
              localStorage.setItem('is_admin', response.data.user.is_admin);
            }
            return response.data;
        }
    } catch (err) {
        console.log("Error", err);
    }
};
  
export const Logout = (data) => {
    return async (dispatch) => {
        try {
          const response = await axios.post(process.env.BACKEND_API_URL+'/account/logout/', data, {
              headers: {
              "Content-Type": "application/json",
              },
          });

          console.log("Response for logout:", response);
          if (response.status === 204) {
              localStorage.clear();
              console.log("LOCAL STORAGE", localStorage)
              dispatch(logout());
          }
        } catch (err) {
          console.log("Error", err);
          dispatch(logout());
          persistor.purge();
        }
    };
};