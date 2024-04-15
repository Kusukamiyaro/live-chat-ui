import React, { useContext, useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import SearchIcon from "@mui/icons-material/Search";
import ConversationItems from "./ConversationItems";
import { useNavigate } from "react-router-dom";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { myContext } from "./MainContainer";
import envProperty from "../environment";
import { Autocomplete, TextField } from "@mui/material";
function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConverstation] = useState([]);
  const [searchedUsers, setSearcheddUser] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});
  function logOutHandler() {
    localStorage.setItem("userData", "");
    navigate("/");
  }
  function searchUser(event) {
    console.log(event);
    const config = {
      headers: { Authorization: `Bearer ${userData.data.token}` },
    };
    axios
      .post(`${envProperty.url}/user/search`, { username: event }, config)
      .then((response) => {
        console.log("users", response);
        setSearcheddUser(response.data);
      });
  }
  const selectedConvo = (e, newval) => {
    console.log("val", newval);
    const user = searchedUsers.find((user) => user.name === newval);

    console.log(user);
    const config = {
      headers: { Authorization: `Bearer ${userData.data.token}` },
    };
    axios
      .post(`${envProperty.url}/chat/`, { userId: user._id }, config)
      .then(({ data }) => {
        console.log("data", data);
        navigate("/app/chat/" + data._id + "&" + data.chatName);
      })
      .catch((e) => console.log(e));
    //do dispatch here
  };
  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${userData.data.token}` },
    };
    axios.get(`${envProperty.url}/chat/`, config).then((response) => {
      console.log("side bar data", response);
      setConverstation(response.data);
    });
  }, [refresh]);

  return (
    <div className={"sideBar-container" + (lightTheme ? "" : " dark")}>
      <div className={"sb-Header" + (lightTheme ? "" : " dark")}>
        <div className={"other-icons" + (lightTheme ? "" : " dark")}>
          <IconButton>
            <AccountCircleIcon
              className={"icon" + (lightTheme ? "" : " dark")}
            />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("users");
            }}
          >
            <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("groups");
            }}
          >
            <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("create-groups");
            }}
          >
            <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lightTheme && (
              <NightlightIcon
                className={"icon" + (lightTheme ? "" : " dark")}
              />
            )}
            {!lightTheme && (
              <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </IconButton>
          <IconButton onClick={logOutHandler}>
            <LogoutIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className={"sb-search" + (lightTheme ? "" : " dark")}>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <Autocomplete
          freeSolo
          id="free-solo-2-demo"
          disableClearable
          options={searchedUsers.map((option) => option.name)}
          onChange={selectedConvo}
          onInputCapture={(e) => searchUser(e.target.value)}
          className={"search-box" + (lightTheme ? "" : " dark")}
          renderInput={(params) => (
            <TextField
              fullWidth
              {...params}
              label="Search User"
              autoFocus="false"
              InputProps={{
                ...params.InputProps,
                type: "search",
              }}
            />
          )}
        />
        {/* <input
          placeholder="search" onChange={(e)=>searchUser(e.target.value)}
          className={"search-box" + (lightTheme ? "" : " dark")}
        /> */}
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        {conversations.map((convo, i) => {
          console.log("conversations", convo);
          var chatName = "";
          if (convo.users.length === 1) {
            return <div key={i}></div>;
          }
          if (convo.isGroupChat=="true") {
            chatName = convo.chatName;
            console.log("group chat",convo)
          } else {
            convo.users.map((user) => {
              if (user._id !== userData.data._id) {
                chatName = user.name;
                console.log(chatName);
              }
            });
          }
          if (convo.latestMessage === undefined) {
            return (
              <div
                key={i}
                onClick={() => {
                  console.log("Refresh fired from sidebar");
                  // dispatch(refreshSidebarFun());
                  setRefresh(!refresh);
                }}
              >
                <div
                  className="conversation-container"
                  key={i}
                  onClick={() => {
                   
                      navigate(
                        "/app/chat/" + convo._id + "&" + chatName
                      );
                    
                  }}
                >
                  <p className={"convo-icon" + (lightTheme ? "" : " dark")}>
                    {" "}
                    {chatName[0]}
                  </p>
                  <p className={"convo-title" + (lightTheme ? "" : " dark")}>
                    {" "}
                    {chatName}
                  </p>
                  <p
                    className={
                      "convo-lastMessage" + (lightTheme ? "" : " dark")
                    }
                  >
                    {" "}
                    No previous Message, click here to start a new chat
                  </p>
                </div>
              </div>
            );
          } else {
            return (
              <div
                className="conversation-container"
                key={i}
                onClick={() => {
                  navigate(
                    "/app/chat/" + convo._id + "&" + convo.users[1].name
                  );
                }}
              >
                <p className={"convo-icon" + (lightTheme ? "" : " dark")}>
                  {" "}
                  {convo.users[1].name[0]}
                </p>
                <p className={"convo-title" + (lightTheme ? "" : " dark")}>
                  {" "}
                  {convo.users[1].name}
                </p>
                <p
                  className={"convo-lastMessage" + (lightTheme ? "" : " dark")}
                >
                  {convo.latestMessage.content}
                </p>
              </div>
            );
          }
          // return <ConversationItems props={convo} key={convo.name}/>
        })}
      </div>
    </div>
  );
}

export default Sidebar;
