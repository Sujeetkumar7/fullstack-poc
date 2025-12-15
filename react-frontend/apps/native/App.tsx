// apps/native/App.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login } from "@rsd/ui";
import { html, css } from "react-strict-dom";

const Stack = createNativeStackNavigator();

// Define styles via RSD's css.create()
const appStyles = css.create({
  screen: {
    paddingInline: 16,
    paddingBlock: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    color: "#0f172a",
  },
  text: {
    fontSize: 16,
    color: "#111827",
  },
});

function LoginScreen({ navigation }: any) {
  return (
    <Login
      onLogin={({ username }) => {
        navigation.replace("Home", { user: username });
      }}
    />
  );
}

function HomeScreen({ route }: any) {
  const user = route.params?.user;
  return (
    <html.div style={appStyles.screen}>
      <html.h2 style={appStyles.title}>Welcome</html.h2>
      <html.p style={appStyles.text}>Logged in as: {user}</html.p>
    </html.div>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
