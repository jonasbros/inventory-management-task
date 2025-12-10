import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBox({ 
  value, 
  onChange, 
  placeholder = "Search...",
  fullWidth = true,
  sx = {}
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ 
        mb: 2,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        },
        ...sx
      }}
    />
  );
}