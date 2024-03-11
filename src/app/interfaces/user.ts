export interface User {
  
    nom: string ,
    email: string ,
    password: string;
    prenom: string ;
    tel: string ;
    type: string[] ; 
    codePostal: number ; 
    pays: string ; 
    ville: string ; 
    cin: number ; 
    longitude: number ; 
    latitude: number ;
    photo: String
  id: string;
}
export interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface AuthFulFilled {
  token: string;
  userID: string;
}
